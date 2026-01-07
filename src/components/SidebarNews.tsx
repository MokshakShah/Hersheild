import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NewspaperIcon } from 'lucide-react';

export default function SidebarNews() {
  const pathname = usePathname();
  return (
    <Link
      href="/news"
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded transition',
        pathname === '/news'
      )}
      prefetch={false}
    >
      <NewspaperIcon className="w-4 h-4" />
      <span>News</span>
    </Link>
  );
}
