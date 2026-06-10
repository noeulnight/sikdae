import type { ReactNode } from "react";

type StoreImageProps = {
  alt: string;
  fallback?: ReactNode;
  src: null | string;
};

export function StoreImage({ alt, fallback, src }: StoreImageProps) {
  if (!src) {
    return (
      <div className="grid size-full place-items-center bg-muted text-muted-foreground">
        {fallback}
      </div>
    );
  }

  return <img src={src} alt={alt} className="size-full object-cover" loading="lazy" />;
}
