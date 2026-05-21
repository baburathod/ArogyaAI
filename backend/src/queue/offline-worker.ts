import { fileURLToPath } from 'url';
import { connectDB } from '../config/database';
import * as dbUtils from '../utils/db';

async function processOfflineQueueItem() {
  const item = await dbUtils.getNextOfflineQueuedItem();
  if (!item) {
    return null;
  }

  try {
    switch (item.type) {
      case 'medication-taken':
        // TODO: map payload to a proper Medication record or notification
        await dbUtils.createNotification({
          userId: item.payload.userId,
          type: 'medication',
          title: 'Offline medication sync',
          message: `Medication taken: ${item.payload.name || item.payload.medId}`,
          severity: 'info',
          createdAt: new Date(),
        });
        break;
      case 'appointment':
        await dbUtils.createAppointment(item.payload);
        break;
      default:
        throw new Error(`Unsupported offline queue type: ${item.type}`);
    }

    await dbUtils.markOfflineQueueItemDone(item._id.toString());
    return item;
  } catch (error) {
    await dbUtils.markOfflineQueueItemFailed(item._id.toString(), error instanceof Error ? error.message : 'Unknown');
    return null;
  }
}

async function main() {
  await connectDB();
  console.log('Offline queue worker started');
  while (true) {
    const item = await processOfflineQueueItem();
    if (!item) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      continue;
    }
  }
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFile) {
  main().catch((error) => {
    console.error('Offline worker failed:', error);
    process.exit(1);
  });
}
