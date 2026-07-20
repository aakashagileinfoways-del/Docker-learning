import mongoose, { InferSchemaType, HydratedDocument } from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    source: {
      type: String,
      required: true,
      enum: [
        'gmail',
        'slack',
        'github',
        'vscode',
        'chrome',
        'calendar',
        'notion',
        'drive',
        'photos',
        'manual',
      ],
    },
    type: {
      type: String,
      required: true,
      enum: [
        'email',
        'message',
        'commit',
        'file_edit',
        'browse',
        'meeting',
        'note',
        'file',
        'photo',
        'other',
      ],
    },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    summary: { type: String, default: '' },
    occurredAt: { type: Date, required: true, index: true },
    projectId: { type: String, default: null, index: true },
    tags: { type: [String], default: [] },
    sourceEventId: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

eventSchema.index({ userId: 1, occurredAt: -1 });
eventSchema.index(
  { userId: 1, source: 1, sourceEventId: 1 },
  {
    unique: true,
    partialFilterExpression: { sourceEventId: { $type: 'string' } },
  },
);

export type Event = InferSchemaType<typeof eventSchema>;
export type EventDocument = HydratedDocument<Event>;

const EventEntity = mongoose.model('Event', eventSchema);

export default EventEntity;
