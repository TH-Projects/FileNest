// Tranform the timestamp to a human-readable format
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).replace(',', '');
};
  
// Function to format file size in bytes to human-readable format
export const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = Math.ceil(bytes / Math.pow(k, i));
  return size + " " + sizes[i];
};

// Component for displaying a result/error message to the user
export const createResultMessage = (isSuccess, message) => (
  <h5 className={`text-${isSuccess ? 'success' : 'danger'} fs-6 mt-2 mb-2`}>
      {message}
  </h5>
);
