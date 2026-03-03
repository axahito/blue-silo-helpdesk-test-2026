import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getORM } from '../utils/connect';
import { User } from '../entities/User';
import { Role } from '../types/types';
import crypto from 'crypto';
import { ObjectId } from '@mikro-orm/mongodb';

const SECRET = process.env.JWT_SECRET || 'dev-secret';
const ACCESS_EXPIRES = '15m';

const COOKIE_SECURE = process.env.NODE_ENV === 'production';
const COOKIE_SAMESITE = process.env.NODE_ENV === 'production' ? 'none' : 'lax';

function signAccess(user: User){
  return jwt.sign({ id: user._id.toString(), username: user.username, role: user.role }, SECRET, { expiresIn: ACCESS_EXPIRES });
}

export async function login(req: Request, res: Response){
  try {
    console.log('[auth] login attempt for', req.body.username);
    const { username, password } = req.body;
    const orm = getORM();
    const em = orm.em.fork();
    
    const user = await em.findOne(User, { username });
    if (!user) return res.status(401).json({ message: 'Invalid' });
    
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid' });

    const token = signAccess(user);
    const refresh = crypto.randomBytes(48).toString('hex');
    user.refreshToken = refresh;
    await em.persistAndFlush(user);

    // set access token as httpOnly cookie
    res.cookie('accessToken', token, { httpOnly: true, secure: COOKIE_SECURE, sameSite: COOKIE_SAMESITE as any, maxAge: 15 * 60 * 1000 });
    // set refresh token as httpOnly cookie
    res.cookie('refreshToken', refresh, { httpOnly: true, secure: COOKIE_SECURE, sameSite: COOKIE_SAMESITE as any });
    res.json({ ok: true });
  } catch (err) {
    console.error('[auth] login error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
}

export async function logout(req: Request, res: Response){
  try{
    const r = req.cookies?.refreshToken;
    if (r){
      const orm = getORM();
      const em = orm.em.fork();
      const user = await em.findOne(User, { refreshToken: r });
      if (user) {
        user.refreshToken = null;
        await em.persistAndFlush(user);
      }
    }
    res.clearCookie('accessToken', { secure: COOKIE_SECURE, sameSite: COOKIE_SAMESITE as any });
    res.clearCookie('refreshToken', { secure: COOKIE_SECURE, sameSite: COOKIE_SAMESITE as any });
    res.json({ ok: true });
  }catch(err){
    console.error('[auth] logout error:', err);
    res.status(500).json({ message: 'Failed to logout' });
  }
}

export async function refreshToken(req: Request, res: Response){
  try{
    console.log('[auth] refreshToken called, cookie=', req.cookies?.refreshToken);
    const r = req.cookies?.refreshToken;
    if (!r) return res.status(401).json({ message: 'No refresh' });
    
    const orm = getORM();
    const em = orm.em.fork();
    const user = await em.findOne(User, { refreshToken: r });
    if (!user) return res.status(401).json({ message: 'Invalid refresh' });
    
    const token = signAccess(user);
    // set new access token as httpOnly cookie
    res.cookie('accessToken', token, { httpOnly: true, secure: COOKIE_SECURE, sameSite: COOKIE_SAMESITE as any, maxAge: 15 * 60 * 1000 });
    res.json({ ok: true });
  }catch(err){
    console.error('[auth] refreshToken error:', err);
    res.status(500).json({ message: 'Failed to refresh' });
  }
}

// Utility to create a user (dev only)
export async function seedUser(req: Request, res: Response){
  try {
    const { username, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    
    const orm = getORM();
    const em = orm.em.fork();
    
    const user = em.create(User, { 
      username, 
      passwordHash: hash, 
      role: role || Role.L1,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
    await em.persistAndFlush(user);
    
    res.json({ username: user.username, role: user.role, id: user._id });
  } catch (err) {
    console.error('[auth] seedUser error:', err);
    res.status(500).json({ message: 'Failed to create user' });
  }
}

// Get current user info
export async function getMe(req: any, res: Response){
  try{
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    
    const orm = getORM();
    const em = orm.em.fork();
    const user = await em.findOne(User, { _id: new ObjectId(req.user.id) });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ username: user.username, role: user.role, id: user._id });
  }catch(err){
    console.error('[auth] getMe error:', err);
    res.status(500).json({ message: 'Failed to get user' });
  }
}
