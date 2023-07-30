import { Box, Tooltip } from "@mui/material";

function RoomLabel({ room }) {
  return (
    <Tooltip title={room.name} placement="top">
      <Box
        sx={{
          display: "inline-block",
          width: 10,
          height: 10,
          borderRadius: "100%",
          backgroundColor: room.color,
        }}
      />
    </Tooltip>
  );
}

export default RoomLabel;
