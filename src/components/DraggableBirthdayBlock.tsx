"use client";

import { Rnd } from "react-rnd";
import type { BirthdayPerson } from "@/types/birthday";
import { formatBirthday } from "@/lib/dateUtils";

type DraggableBirthdayBlockProps = {
  person: BirthdayPerson;
  x: number;
  y: number;
  width: number;
  height: number;
  fontScale: number;
  scale?: number;
  onMove: (birthdayId: string, x: number, y: number) => void;
};

const fixedNameFontSize = 20;
const fixedRoleFontSize = 15;
const fixedBirthdayFontSize = 18;

function getNameWidthUnits(value: string) {
  return Array.from(value).reduce((total, character) => {
    if ("MWÁÀÂÃÉÊÍÓÔÕÚÇ".includes(character.toUpperCase())) {
      return total + 0.78;
    }

    if ("IÍILJT1".includes(character.toUpperCase())) {
      return total + 0.34;
    }

    return total + 0.56;
  }, 0);
}

export function splitNameIntoLines(name: string) {
  const normalized = name.trim().replace(/\s+/g, " ");

  if (normalized.length <= 12) {
    return [normalized, ""];
  }

  const words = normalized.split(" ");

  if (words.length === 1) {
    return [normalized, ""];
  }

  const lineOptions = words.slice(1).map((_, index) => {
    const breakIndex = index + 1;
    return {
      firstLine: words.slice(0, breakIndex).join(" "),
      secondLine: words.slice(breakIndex).join(" ")
    };
  });

  const bestOption = lineOptions.reduce((best, current) => {
    const bestLongestLine = Math.max(best.firstLine.length, best.secondLine.length);
    const currentLongestLine = Math.max(current.firstLine.length, current.secondLine.length);
    const bestBalance = Math.abs(best.firstLine.length - best.secondLine.length);
    const currentBalance = Math.abs(current.firstLine.length - current.secondLine.length);

    if (currentLongestLine !== bestLongestLine) {
      return currentLongestLine < bestLongestLine ? current : best;
    }

    return currentBalance < bestBalance ? current : best;
  });

  return [bestOption.firstLine, bestOption.secondLine];
}

export function DraggableBirthdayBlock({
  person,
  x,
  y,
  width,
  height,
  fontScale,
  scale = 1,
  onMove
}: DraggableBirthdayBlockProps) {
  const contentScale = Math.max(1, Math.min(width / 170, height / 226));
  const photoHeight = Math.round(Math.max(64 * contentScale, Math.min(width * 0.64, height * 0.48, 123 * contentScale)));
  const photoWidth = Math.round(photoHeight * 0.75);
  const cardPadding = Math.round(8 * contentScale);
  const photoPadding = Math.round(1 * contentScale);
  const photoBorder = Math.round(3 * contentScale);
  const birthdayFontSize = Math.round(fixedBirthdayFontSize * fontScale);
  const roleFontSize = Math.round(fixedRoleFontSize * fontScale);
  const textGap = Math.round(6 * contentScale);
  const textShadow = "0 1px 4px rgba(255, 255, 255, 0.55)";
  const nameLines = splitNameIntoLines(person.name);
  const availableNameWidth = Math.max(1, width - cardPadding * 2);
  const longestNameWidth = Math.max(...nameLines.map(getNameWidthUnits));
  const nameFontSize = Math.round(
    Math.min(fixedNameFontSize * fontScale, availableNameWidth / Math.max(longestNameWidth, 1))
  );
  const nameLineHeight = Math.round(nameFontSize * 1.12);

  return (
    <Rnd
      bounds="parent"
      size={{ width, height }}
      minWidth={96}
      minHeight={128}
      position={{ x, y }}
      scale={scale}
      onDragStop={(_, data) => onMove(person.id, data.x, data.y)}
      className="z-20"
      enableResizing={false}
    >
      <div
        className="flex h-full w-full cursor-move flex-col items-center justify-start text-center report-export-surface"
        style={{ padding: cardPadding }}
      >
        <div
          className="shrink-0 overflow-hidden rounded-md border-white bg-white shadow-md"
          style={{ borderWidth: photoBorder, height: photoHeight, padding: photoPadding, width: photoWidth }}
        >
          <img
            src={person.photoDataUrl}
            alt={person.name}
            className="h-full w-full rounded-sm object-cover"
            draggable={false}
          />
        </div>
        <div
          className="min-w-0 font-bold text-black"
          style={{
            fontSize: nameFontSize,
            height: nameLineHeight * 2,
            lineHeight: `${nameLineHeight}px`,
            marginTop: textGap,
            textShadow,
            width: "100%"
          }}
        >
          <span className="block whitespace-nowrap">{nameLines[0] || "\u00a0"}</span>
          <span className="block whitespace-nowrap">{nameLines[1] || "\u00a0"}</span>
        </div>
        <div
          className="min-w-0 font-medium leading-tight text-black"
          style={{ fontSize: roleFontSize, marginTop: Math.round(4 * contentScale), textShadow }}
        >
          {person.role}
        </div>
        <div
          className="font-semibold text-black"
          style={{ fontSize: birthdayFontSize, marginTop: Math.round(4 * contentScale), textShadow }}
        >
          {formatBirthday(person.birthdayDay, person.birthdayMonth)}
        </div>
      </div>
    </Rnd>
  );
}
