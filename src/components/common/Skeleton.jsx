
export function CardPlacehoderSkeleton() {
  return (
    <div className='mb-4 animate-pulse h-[100px] lg:h-[400px] w-[400px]'>
    <div className="h-[100px] lg:h-[800px]">
        <div>
            <div className="h-48 bg-pure-greys-200 rounded-xl"></div>
        </div>
        <div className='flex flex-col gap-2 px-1 py-3'>
            <div className='h-4 bg-pure-greys-200 rounded w-3/4'></div>
            <div className='h-4 bg-pure-greys-200 rounded w-1/2'></div>
            <div className='w-3/4 bg-pure-greys-200 h-4 rounded'></div>
            <div className='h-4 bg-pure-greys-200 rounded w-1/4'></div>
        </div>
    </div>
</div>
  );
}