import type { ImgHTMLAttributes } from "react";

type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
};

export default function Image({ src, alt, ...rest }: ImageProps) {
  const resolvedSrc = typeof src === "string" ? src : String(src);
  return <img src={resolvedSrc} alt={alt} {...rest} />;
}
