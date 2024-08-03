"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const avatarUrls: { [key: number]: string } = {
  1: "https://models.readyplayer.me/66940e7534432ca7ede8e1fd.glb",
  2: "https://models.readyplayer.me/6694114b878f8e58dc31a86b.glb",
  3: "https://models.readyplayer.me/669411f67a0772243cfc9cd2.glb",
  4: "https://models.readyplayer.me/6694131434432ca7ede8f974.glb"
};

export default function Page() {
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAvatarSelect = (avatarNumber: number) => {
    setSelectedAvatar(avatarNumber);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User not authenticated');
      return;
    }

    try {
      const avatar_url = selectedAvatar ? avatarUrls[selectedAvatar] : '';
      
      console.log(userId);
      const response = await fetch('/api/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, username, gender, bio, avatar_url }),
      });

      if (response.ok) {
        router.push('/home-page');
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-12 bg-background">
      <div className="mx-auto w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-foreground">
            Complete your profile
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Fill out the form to get started with your new account
          </p>
        </div>
        <form className="w-full max-w-md space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" required placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} required onValueChange={(value) => setGender(value)}>
                <SelectTrigger id="gender" aria-label="Gender">
                  <SelectValue placeholder="Select gender"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself"
                className="min-h-[100px]"
                value={bio}
                required
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Choose an avatar</Label>
              <div className="flex justify-center space-x-4 cursor-pointer">
                {[1, 2, 3, 4].map((avatarNumber) => (
                  <Avatar
                    key={avatarNumber}
                    className={`ring-2 h-20 w-20 ring-transparent hover:ring-primary transition-colors ${
                      selectedAvatar === avatarNumber ? "ring-primary" : ""
                    }`}
                    onClick={() => handleAvatarSelect(avatarNumber)}
                  >
                    <AvatarImage src={`https://avatar.iran.liara.run/public/${avatarNumber * 23}`} />
                    <AvatarFallback>{avatarNumber}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          </div>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
}
