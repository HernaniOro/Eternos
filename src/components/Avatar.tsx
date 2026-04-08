import { Profile } from "@/data/types";

export default function Avatar({
  profile,
  size = "md",
}: {
  profile: Profile;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-20 h-20 text-2xl",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${profile.accentColor} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
    >
      {profile.avatar}
    </div>
  );
}
