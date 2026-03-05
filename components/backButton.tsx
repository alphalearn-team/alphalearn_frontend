"use client";

import { useRouter } from "next/navigation";
import { Button } from "@mantine/core";
import { ReactNode } from "react";
export default function BackButton({ href,children }: { href?: string,children?:ReactNode }) {
  const router = useRouter();

  return (
    <Button
      radius="xl"
      size="lg"
      color="#7c3aed"
      my="lg"
      mx="md"
      onClick={() => {
        if (href) {
          router.push(href);
          return;
        }

        router.back();
      }}
    >
      {children ?? "Back"}
    </Button>
  );
}
