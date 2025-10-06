'use server';

import { suggestPostTags } from '@/ai/flows/suggest-post-tags';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { users } from './data';
import type { User } from './types';

const IS_DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
const AUTH_COOKIE_NAME = 'coolpeople-auth';

// Mock function to "save" a post
async function savePost(post: { content: string; tags: string[] }) {
  console.log('Saving post:', post);
  // In a real app, you'd save this to a database and the mock data would be updated.
  // For now, we just simulate a delay.
  await new Promise(resolve => setTimeout(resolve, 500));
  return { success: true };
}

export async function createPostAction(prevState: any, formData: FormData) {
  const content = formData.get('content') as string;
  const tags = formData.getAll('tags') as string[];

  if (!content || content.trim().length === 0) {
    return { message: 'Content cannot be empty.', type: 'error' };
  }

  try {
    await savePost({ content, tags });
    revalidatePath('/');
    return { message: 'Post created successfully!', type: 'success' };
  } catch (error) {
    return { message: 'Failed to create post.', type: 'error' };
  }
}

export async function suggestTagsAction(postContent: string) {
  if (!postContent) {
    return { suggestedTags: [], error: null };
  }
  try {
    const result = await suggestPostTags({ postContent });
    return { suggestedTags: result.suggestedTags, error: null };
  } catch (error) {
    console.error('Error suggesting tags:', error);
    return { suggestedTags: [], error: 'Could not suggest tags.' };
  }
}

export async function loginAction(prevState: any, formData: FormData) {
  if (!IS_DEBUG_MODE) {
    return { message: 'Login is only available in debug mode.', type: 'error' };
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { message: 'Email and password are required.', type: 'error' };
  }

  // In debug mode, any email/password is valid. We'll just use the first user for the session.
  const user = users[0];

  cookies().set(AUTH_COOKIE_NAME, JSON.stringify(user), {
    httpOnly: true,
    maxAge: 60 * 60 * 24, // 1 day
  });

  return { message: 'Logged in successfully!', type: 'success' };
}

export async function logoutAction() {
  cookies().delete(AUTH_COOKIE_NAME);
}

export async function getSessionAction(): Promise<{ user: User | null }> {
  const cookie = cookies().get(AUTH_COOKIE_NAME);
  if (!cookie) {
    return { user: null };
  }
  try {
    const user = JSON.parse(cookie.value) as User;
    return { user };
  } catch (error) {
    return { user: null };
  }
}
