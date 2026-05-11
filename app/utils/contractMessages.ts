import { ContractAction, ContractMessage } from '../types/contracts';

export function generateContractMessage(contractData: ContractMessage): string {
  const { taskId, taskTitle, action, performerId } = contractData;
  const timestamp = new Date().toISOString();

  const messages: Record<ContractAction, string> = {
    create:
      `Creating Task Contract\n\n` +
      `Task #${taskId}: ${taskTitle}\nAction: Task Creation\nTimestamp: ${timestamp}\n\n` +
      `By signing this message, you agree to create this task and be bound by the platform's terms and conditions.`,

    delete:
      `Deleting Task Contract\n\n` +
      `Task #${taskId}: ${taskTitle}\nAction: Task Deletion\nTimestamp: ${timestamp}\n\n` +
      `By signing this message, you confirm the permanent deletion of this task.`,

    accept:
      `Accepting Freelancer Contract\n\n` +
      `Task #${taskId}: ${taskTitle}\nAction: Accept Freelancer\n` +
      `Freelancer ID: ${performerId ?? 'unknown'}\nTimestamp: ${timestamp}\n\n` +
      `By signing this message, you agree to accept this freelancer for the task.`,

    complete:
      `Task Completion Contract\n\n` +
      `Task #${taskId}: ${taskTitle}\nAction: Task Completion\n` +
      `Freelancer ID: ${performerId ?? 'unknown'}\nTimestamp: ${timestamp}\n\n` +
      `By signing this message, you confirm satisfactory completion and agree to release payment.`,

    discard:
      `Task Freelancer Discard Contract\n\n` +
      `Task #${taskId}: ${taskTitle}\nAction: Task Freelancer Discard\n` +
      `Freelancer ID: ${performerId ?? 'unknown'}\nTimestamp: ${timestamp}\n\n` +
      `By signing this message as admin, you confirm discarding the task freelancer. This cannot be undone.`,
  };

  return messages[action];
}
