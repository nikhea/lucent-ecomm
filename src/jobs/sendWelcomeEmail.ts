import { render } from '@react-email/render'
import type { CollectionAfterChangeHook, TaskConfig } from 'payload'
import WelcomeEmail from '@/emails/welcome'
import { getServerSideURL } from '@/utilities/getURL'

export const sendWelcomeEmailTask = {
  slug: 'sendWelcomeEmail',
  inputSchema: [{ name: 'userID', type: 'text', required: true }],
  outputSchema: [{ name: 'emailSent', type: 'checkbox', required: true }],
  retries: 3,
  handler: async ({ input, req }) => {
    const user: any = await req.payload.findByID({
      collection: 'users',
      id: input.userID,
      depth: 0,
    })

    if (!user?.email) {
      throw new Error(`No email for user ${input.userID}`)
    }

    const serverURL = getServerSideURL()
    const html = await render(
      WelcomeEmail({
        name: user.name || undefined,
        shopUrl: `${serverURL}/shop`,
        accountUrl: `${serverURL}/account`,
        companyName: process.env.COMPANY_NAME || 'LUCENT',
      }),
    )

    await req.payload.sendEmail({
      to: user.email,
      subject: `Welcome to ${process.env.COMPANY_NAME || 'LUCENT'}`,
      html,
    })

    return { output: { emailSent: true } }
  },
} as TaskConfig<'sendWelcomeEmail'>

export const queueWelcomeEmail: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  if (operation !== 'create') return
  try {
    await req.payload.jobs.queue({
      task: 'sendWelcomeEmail',
      queue: 'default',
      input: { userID: String((doc as any).id) },
    })
  } catch (err) {
    req.payload.logger.error({ msg: 'Failed to queue welcome email', err })
  }
}
