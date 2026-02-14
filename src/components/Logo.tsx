import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({
  className,
  width = 180,
  height = 60,
}: LogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt="Nordeste Automóvel Clube"
      width={width}
      height={height}
      className={className || 'h-14 w-auto object-contain'}
      style={{ width: 'auto' }}
      priority
    />
  );
}
