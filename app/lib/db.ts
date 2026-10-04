// app/lib/db.ts
import { neon } from '@neondatabase/serverless';

// Initialize the secure serverless HTTP link context
const sql = neon(process.env.DATABASE_URL!);

export const query = async (text: string, params: any[] = []) => {
  /* 
   * FIX: Instead of passing params as a second argument to sql(), 
   * Neon now wants you to explicitly invoke .query() off the sql object,
   * passing your text string first and the arguments array second.
   */
  const rows = await sql.query(text, params);
  
  // Return an object structure that maps perfectly to your route handlers (.rows)
  return { rows };
};
