import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { acceptSharedProject } from '../../services/api';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Sparkles, CheckCircle, XCircle } from 'lucide-react';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function AcceptProject() {
  const query = useQuery();
  const token = query.get('token');
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState('');
  const [newProject, setNewProject] = useState(null);

  // If not logged in, redirect to login with redirect back
  useEffect(() => {
    if (!user && token) {
      navigate(`/login?redirect=/accept-project?token=${token}`);
    }
  }, [user, token, navigate]);

  const handleAccept = async () => {
    setStatus('loading');
    setError('');
    try {
      const res = await acceptSharedProject(token);
      setNewProject(res.newProject);
      setStatus('success');
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to accept project');
      setStatus('error');
    }
  };

  if (!token) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <XCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Invalid Link</h2>
            <p className="text-muted-foreground">No token found in the link.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          {status === 'idle' && (
            <>
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2">Accept Shared Project</h2>
              <p className="text-muted-foreground mb-6">
                You have been invited to add a project to your account. Click below to accept and add it as your own copy.
              </p>
              <Button onClick={handleAccept} className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? 'Accepting...' : 'Accept Project'}
              </Button>
            </>
          )}
          {status === 'loading' && (
            <>
              <div className="mb-4">Processing...</div>
            </>
          )}
          {status === 'success' && newProject && (
            <>
              <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Project Added!</h2>
              <p className="text-muted-foreground mb-4">
                The project has been added to your account. You can now access and edit it as your own.
              </p>
              <Button onClick={() => navigate(`/workspace/${newProject._id}`)} className="w-full">
                Go to Project
              </Button>
            </>
          )}
          {status === 'error' && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 