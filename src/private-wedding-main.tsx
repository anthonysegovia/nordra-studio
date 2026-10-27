import React from 'react';
import ReactDOM from 'react-dom/client';
import { WeddingClient } from './sections/WeddingClient';
import { PrivateWeddingInvitation } from './sections/PrivateWeddingInvitation';
import './styles/wedding-workspace.css';
import './styles/private-weddings.css';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode>{location.pathname==='/invitacion-boda.html'?<PrivateWeddingInvitation/>:<WeddingClient/>}</React.StrictMode>);
