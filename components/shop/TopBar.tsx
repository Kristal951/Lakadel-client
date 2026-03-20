import BreadCrumbs from "./BreadCrumbs";

export default function TopBar() {
  return (
    <div
      style={{ background: "var(--background)" }}
      className="fixed left-0 top-17.5 p-2 right-0 h-12.5 px-10 flex items-center justify-start z-50"
    >
      <BreadCrumbs />
    </div>
  );
}
