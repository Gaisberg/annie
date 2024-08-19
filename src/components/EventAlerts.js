import { useContext, useEffect, useState } from 'react';
import { WebSocketContext } from './WebSocketContext';
import { useAlert } from './AlertContext';
import { Box, Typography, LinearProgress, Alert } from '@mui/material';

const EventAlert = () => {
    const { events } = useContext(WebSocketContext);
    const { addAlert, updateAlert } = useAlert();
    const [alertId, setAlertId] = useState(null);

    useEffect(() => {
        const totalEvents = events.running.length + events.queued.length;
        const runningPercentage = (events.running.length / totalEvents) * 100;
        const queuedPercentage = (events.queued.length / totalEvents) * 100;
        const alertContent = (
            <Alert>
                <Typography variant="body1">
                    Running Events: {events.running.length}, Queued Events: {events.queued.length}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
                    <Box sx={{ width: '100%', marginRight: 1 }}>
                        <LinearProgress variant="determinate" value={runningPercentage} sx={{ backgroundColor: '#e0e0e0', '& .MuiLinearProgress-bar': { backgroundColor: '#4caf50' } }} />
                    </Box>
                    <Box sx={{ width: '100%' }}>
                        <LinearProgress variant="determinate" value={queuedPercentage} sx={{ backgroundColor: '#e0e0e0', '& .MuiLinearProgress-bar': { backgroundColor: '#ff9800' } }} />
                    </Box>
                </Box>
            </Alert>
        );

        if (events.running.length > 0 || events.queued.length > 0) {
            if (alertId) {
                console.log("updating alert")
                updateAlert(alertId, null, 'info', alertContent, true);
            } else {
                const newAlertId = addAlert(null, 'info', alertContent, true);
                setAlertId(newAlertId);
            }
        }
    }, [events, alertId]);

    return null;
};

export default EventAlert;