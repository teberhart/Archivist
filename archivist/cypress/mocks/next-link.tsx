import type { AnchorHTMLAttributes, ReactNode } from "react";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children?: ReactNode;
};

export default function Link({ href, children, ...rest }: LinkProps) {
  const resolvedHref = typeof href === "string" ? href : String(href);
  return (
    <a href={resolvedHref} {...rest}>
      {children}
    </a>
  );
}
