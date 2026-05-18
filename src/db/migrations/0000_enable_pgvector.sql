-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create ivfflat index for embedding similarity search (run after inserting initial data)
-- CREATE INDEX signals_embedding_idx ON signals USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
