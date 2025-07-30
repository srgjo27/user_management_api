import { Request, Response } from 'express';
import { db } from "../services/firebase";
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const usersCollection = db.collection('users');

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
        }

        const userSnapshot = await usersCollection.where('email', '==', email).get();
        if (!userSnapshot.empty) {
            return res.status(400).json({ message: 'Email sudah terdaftar' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : null;

        const newUser = {
            name,
            email,
            password: hashedPassword,
            avatarUrl,
            createdAt: new Date().toISOString(),
        }

        const userRef = await usersCollection.add(newUser);
        const { password: _, ...userWithoutPassword } = newUser;

        res.status(201).json({ id: userRef.id, ...userWithoutPassword });
    } catch (e: any) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: e.message });
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email dan Password wajib diisi' });
        }

        const userSnapshot = await usersCollection.where('email', '==', email).limit(1).get();
        if (userSnapshot.empty) {
            return res.status(404).json({ message: 'Email atau Password salah' });
        }

        const userData = userSnapshot.docs[0].data();
        const userId = userSnapshot.docs[0].id;

        const isPasswordMatch = await bcrypt.compare(password, userData.password);
        if (!isPasswordMatch) {
            return res.status(404).json({ message: 'Email atau Password salah' });
        }

        const { password: _, ...userWithoutPassword } = userData;

        res.status(200).json({ message: 'Login berhasil', user: { id: userId, ...userWithoutPassword } });
    } catch (e: any) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: e.message });
    }
}

export const getUsers = async (req: Request, res: Response) => {
    try {
        const { search, lastVisible } = req.query;
        const limit = 10;

        let query: FirebaseFirestore.Query = usersCollection.orderBy('name');

        if (search && typeof search === 'string' && search.trim() !== '') {
            const end = search.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));
            query = query.where('name', '>=', search).where('name', '<', end);
        }

        if (lastVisible && typeof lastVisible === 'string') {
            const lastDoc = await usersCollection.doc(lastVisible).get();
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc);
            }
        }

        const snapshot = await query.limit(limit + 1).get();
        if (snapshot.empty) {
            return res.status(200).json({ users: [], lastVisible: null });
        }

        let users = snapshot.docs.map(doc => {
            const { password, ...data } = doc.data();
            return { id: doc.id, ...data }
        });

        let newLastVisible = null;
        if (users.length > limit) {
            newLastVisible = users[users.length - 2].id;
            users = users.slice(0, limit);
        }

        res.status(200).json({ users, lastVisible: newLastVisible });
    } catch (e: any) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: e.message });
    }
}

export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userDoc = await usersCollection.doc(id).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        const { password, ...userData } = userDoc.data()!;
        res.status(200).json({ id: userDoc.id, ...userData });
    } catch (e: any) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: e.message });
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const userRef = usersCollection.doc(id);

        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        const oldUserData = userDoc.data();

        const updateData: { name?: string, avatarUrl?: string } = {};
        if (name) {
            updateData.name = name;
        }

        if (req.file) {
            if (oldUserData?.avatarUrl) {
                const oldAvatarPath = path.join(process.cwd(), oldUserData.avatarUrl.substring(1));

                fs.unlink(oldAvatarPath, (err) => {
                    if (err) {
                        console.error('Gagal menghapus avatar lama:', err);
                    } else {
                        console.log('Avatar lama berhasil dihapus', oldAvatarPath);
                    }
                });
            }

            updateData.avatarUrl = `/uploads/avatars/${req.file.filename}`;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'Tidak ada data yang diupdate' });
        }

        await userRef.update(updateData);

        const updateUserDoc = await userRef.get();
        const { password, ...userData } = updateUserDoc.data()!;

        res.status(200).json({ message: 'Profil berhasil diperbarui', user: { id: updateUserDoc.id, ...userData}});
    } catch (e: any) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: e.message });
    }
}