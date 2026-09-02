type BuyerUnitNoteProps = {
  buyerUnit: string;
};

export default function BuyerUnitNote({ buyerUnit }: BuyerUnitNoteProps) {
  return (
    <p className="text-xs text-muted-foreground">
      You wrote &ldquo;{buyerUnit}&rdquo; — unit not recognised
    </p>
  );
}
