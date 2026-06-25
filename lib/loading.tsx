import { CircularProgress, Box } from "@mui/material";

interface LoadingProps {
  size?: number;
  minHeight?: string | number;
}

export function Loading({ size = 50, minHeight = "400px" }: LoadingProps) {
  return (
    <Box 
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight,
        background: 'inherit',
      }}
    >
      <CircularProgress size={size} />
    </Box>
  );
}
