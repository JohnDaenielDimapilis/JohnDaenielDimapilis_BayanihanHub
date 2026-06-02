export default function Avatar({ name, size = "md", className = "" }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const sizeClass = { sm: "avatar-sm", md: "avatar-md", lg: "avatar-lg" }[size] || "avatar-md";

  return (
    <div className={`avatar ${sizeClass} ${className}`} title={name}>
      {initials}
    </div>
  );
}
