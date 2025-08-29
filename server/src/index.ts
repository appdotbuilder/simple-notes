import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  createNoteInputSchema, 
  updateNoteInputSchema,
  getNoteInputSchema,
  deleteNoteInputSchema
} from './schema';

// Import handlers
import { createNote } from './handlers/create_note';
import { getNotes } from './handlers/get_notes';
import { getNote } from './handlers/get_note';
import { updateNote } from './handlers/update_note';
import { deleteNote } from './handlers/delete_note';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Create a new note
  createNote: publicProcedure
    .input(createNoteInputSchema)
    .mutation(({ input }) => createNote(input)),

  // Get all notes
  getNotes: publicProcedure
    .query(() => getNotes()),

  // Get a single note by ID
  getNote: publicProcedure
    .input(getNoteInputSchema)
    .query(({ input }) => getNote(input)),

  // Update an existing note
  updateNote: publicProcedure
    .input(updateNoteInputSchema)
    .mutation(({ input }) => updateNote(input)),

  // Delete a note by ID
  deleteNote: publicProcedure
    .input(deleteNoteInputSchema)
    .mutation(({ input }) => deleteNote(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();