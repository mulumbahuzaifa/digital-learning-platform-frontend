import { ClipLoader } from "react-spinners";

export default function LoadingSpinner({ fullScreen = false, size = 40 }) {
    return (
      <div className={`grid place-items-center ${fullScreen ? "h-screen" : "h-full"}`}>
        <ClipLoader size={size} color="#3b82f6" />
      </div>
    );
  }