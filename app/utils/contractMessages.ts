import { ContractAction, ContractMessage } from '../types/contracts';
import { getUser } from '../data/mockUsers';

export function generateContractMessage(contractData: ContractMessage): string {
  const { taskId, taskTitle, action, performerId } = contractData;
  const timestamp = new Date().toISOString();

  const messages: Record<ContractAction, string> = {
    create: `Creating Task Contract\n\n` +
           `Task #${taskId}: ${taskTitle}\n` +
           `Action: Task Creation\n` +
           `Timestamp: ${timestamp}\n\n` +
           `By signing this message, you agree to create this task and be bound by the platform's terms and conditions.`,

    delete: `Deleting Task Contract\n\n` +
           `Task #${taskId}: ${taskTitle}\n` +
           `Action: Task Deletion\n` +
           `Timestamp: ${timestamp}\n\n` +
           `By signing this message, you confirm the permanent deletion of this task.`,

    accept: (() => {
      const performer = performerId ? getUser(performerId) : null;
      return `Accepting Freelancer Contract\n\n` +
             `Task #${taskId}: ${taskTitle}\n` +
             `Action: Accept Freelancer\n` +
             `Freelancer: ${performer?.username || 'Unknown'} (ID: ${performerId})\n` +
             `Timestamp: ${timestamp}\n\n` +
             `By signing this message, you agree to accept this freelancer for the task.`;
    })()
  };

  return messages[action];
} 