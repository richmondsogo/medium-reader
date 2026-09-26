import { UiLabel } from '@/components/ui/typography';

export default function ReaderEmptyState() {
  return (
    <div className='flex h-full items-center justify-center'>
      <UiLabel as='p' className='text-muted-foreground'>Select an article to read</UiLabel>
    </div>
  );
}
