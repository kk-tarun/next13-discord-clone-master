import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, username, gender, bio, avatar_url } = req.body;

  if (!userId || !username || !gender || !avatar_url) {
    return res.status(400).json({ message: 'All fields except bio are required' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username,
        gender,
        bio,
        avatar_url,
      },
    });
    console.log(updatedUser);

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error: any) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
