import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import https from 'https';

import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3001;
const app = express();
app.use(cors());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT)
});

app.get("/api/data/:tableName", async (req: Request, res: Response) => {
  const { tableName } = req.params;

  try {
    const result = await pool.query(`SELECT * FROM public."${tableName}"`);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/query/:sqlQuery", async (req: Request, res: Response) => {
  const { sqlQuery } = req.params;

  try {
    const result = await pool.query(sqlQuery);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/row", async (req: Request, res: Response) => {
  try {
    const query = {
      text: `SELECT RowID, Status
      FROM public."RowData"
      ORDER BY RowID ASC;
      `,
    };

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/status", async (req: Request, res: Response) => {
  try {
    const query = {
      text: `SELECT *
      FROM public."RowData"
      ORDER BY RowID ASC;
      `,
    };

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/status/:rowId", async (req: Request, res: Response) => {
  try {
    const { rowId } = req.params;
    const query = {
      text: `SELECT *
            FROM public."RowData"
            WHERE RowID = $1
            ORDER BY RowID ASC`,
      values: [rowId],
    };

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/plant", async (req: Request, res: Response) => {
  try {
    const query = {
      text: `SELECT *
      FROM public."PlantData"
      ORDER BY RowID ASC;
      `,
    };

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/plant/:rowId", async (req: Request, res: Response) => {
  try {
    const { rowId } = req.params;
    const query = {
      text: `SELECT *
          FROM public."PlantData" pd
          JOIN (
          SELECT PlantID, MAX(Timestamp) AS latest_timestamp
          FROM public."PlantData"
          WHERE RowID = $1
          GROUP BY PlantID
          ) AS latest ON pd.PlantID = latest.PlantID AND pd.Timestamp = latest.latest_timestamp
          ORDER BY pd.PlantID ASC;
      
      `,
      values: [rowId],
    };

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/plant/:rowId/:plantId/:property", async (req: Request, res: Response) => {
  try {
    const { rowId, plantId, property } = req.params;
    const query = {
      text: `SELECT timestamp, ${property}
      FROM public."PlantData"
      WHERE RowID = $1 AND PlantID = $2
      ORDER BY timestamp ASC`,
      values: [rowId, plantId],
    };

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error executing query:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
