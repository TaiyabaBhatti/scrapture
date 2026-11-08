import { useState } from "react";

// Before / after slider. Drag anywhere on the picture.
export default function Compare({ before, after, labelBefore, labelAfter }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="flex gap-x-4">
      <img src={before} alt={labelBefore} className="h-96 w-96 object-cover" />
      <img className="object-cover h-96 w-96" src={after} alt={labelAfter} />
    </div>
  );
}
