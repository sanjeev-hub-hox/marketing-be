import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";

interface PopupProps {
  open: boolean;
  onClose:any
  data?: any
}

const RemarksPopup: React.FC<PopupProps> = ({ open, onClose,data }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Box sx={{ minWidth: 300, minHeight: 100 }}>
          <Typography variant="body1" fontWeight="bold">
            Remarks:
          </Typography>
          <Typography variant="body2" sx={{ mt: 10 }}>
            {data}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemarksPopup;
