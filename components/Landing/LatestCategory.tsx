import { IoShirtOutline } from "react-icons/io5";
import SelectionBar from "./CategorySelectionBar";
import { GiHoodie, GiTrousers } from "react-icons/gi";
import { PiBaseballCap } from "react-icons/pi";

export default function LatestCategory() {
  const icons = [
    { icon: <IoShirtOutline />, label: "Shirt" },
    { icon: <GiTrousers />, label: "Trousers" },
    { icon: <GiHoodie />, label: "Settings" },
    { icon: <PiBaseballCap />, label: "Caps" },
  ];
  return (
    <div className="w-full h-screen flex flex-col md:px-20 md:py-10 px-4 py-2">
      <h1 className="text-[#B10E0E] text-3xl font-medium">Latest Products</h1>

      <div className="w-full">
        <SelectionBar iconObject={icons} />
      </div>
    </div>
  );
}
