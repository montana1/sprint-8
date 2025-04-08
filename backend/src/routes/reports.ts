import { Request, Response, Router } from 'express';


const checkProtheticRole = (req: Request, res: Response, next: any) => {
    try {
      const accessToken = (req as any).kauth?.grant?.access_token;

      console.log('JWT:', accessToken);
      
      console.log('User roles in token:', accessToken?.content.realm_access?.roles);
      
      if (!accessToken.content.realm_access?.roles?.includes('prothetic_user')) {
        console.warn('Access denied for user:', accessToken.content.preferred_username);
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      next();
    } catch (err) {
      console.error('Role check error:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

const router = Router();

// Hardcoded reports data
const reports = [
  { id: 1, title: 'Quarterly Sales Report', content: 'Sales increased by 15%' },
  { id: 2, title: 'User Activity Report', content: 'Active users: 1250' },
  { id: 3, title: 'System Performance Report', content: 'Uptime: 99.9%' },
];

router.get('/', 
    (req: Request, res: Response) => {
        res.send('Добро пожаловать!!!');
    }
  );

router.get('/reports',
    (req: Request, res: Response, next: any) => {
      checkProtheticRole(req, res, next);
      res.json(reports);
    }
  );

export default router;