import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
  // Return null because redirect will throw an error to stop rendering
  return null;
}
