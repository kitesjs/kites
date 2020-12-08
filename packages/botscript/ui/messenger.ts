import { json as _json } from 'body-parser';
import { createHmac } from 'crypto';
import { EventEmitter } from 'events';

export class MessengerUI extends EventEmitter {
  app: any;
  webhook: any;
  intelligoClassifier: any;

  constructor(
    private PAGE_ACCESS_TOKEN: string,
    private VALIDATION_TOKEN: string,
    private APP_SECRET: string,
    private FB_URL: string,
  ) {
    super();
  }

  /**
   * init webhook
   * @param param0
   */
  init({ app, kites, logger, options }) {

    /**
     * Verify request from fb.
     */

    app.use(_json({ verify: this.verifyRequestSignature.bind(this) }));

    /**
     * Use your own validation token. Check that the token used in the Webhook
     * setup is the same token used here.
     */
    app.get(options.webhook, (req: any, res: any) => {
      if (req.query['hub.mode'] === 'subscribe'
        && req.query['hub.verify_token'] === this.VALIDATION_TOKEN) {
        res.status(200).send(req.query['hub.challenge']);
        logger.info('Validating webhook');
      } else {
        res.sendStatus(403);
        logger.info('Failed validation. Make sure the validation tokens match.');
      }
    });

    /*
     * All callbacks for Messenger are POST-ed. They will be sent to the same
     * webhook. Be sure to subscribe your app to your page to receive callbacks
     * for your page.
     * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
     */
    app.post(options.webhook, (req: any, res: any) => {
      var data = req.body;
      res.sendStatus(200); // return signal message ok

      // handle the message
      if (data.object === 'page') {

        for (const pageEntry of data.entry) {
          for (const messagingEvent of pageEntry.messaging) {
            this.handleEvent(messagingEvent);
          }
        }

      }
    });

  }

  // Iterate over each messaging event
  handleEvent(event: any) {
    // get sender id.
    let sender = event.sender.id;
    if (event.optin) {
      let optin = event.optin.ref;
      this.emit('optin', { sender, event, optin });
    } else if (typeof event.message === 'string') {
      this.emit('message', { event });
    } else if (event.message && !event.message.is_echo) {
      this.emit('message', { event, is_echo: false });
    } else if (event.message && event.message.attachment) {
      let { attachment, url, quickReplies } = event.message;
      this.emit('attachment', { sender, attachment, url, quickReplies });
    } else if (event.delivery) {
      let mids = event.delivery.mids;
      this.emit('delivery', { sender, event, mids });
    } else if (event.read) {
      let recipient = event.recipient.id;
      let read = event.read;
      this.emit('read', { recipient, sender, read });
    } else if (event.postback || (event.message && !event.message.is_echo && event.message.quick_reply)) {
      let postback = (event.postback && event.postback.payload) || event.message.quick_reply.payload;
      let ref = event.postback && event.postback.referral && event.postback.referral.ref;
      this.emit('postback', event.sender.id, postback);
    } else if (event.referral) {
      let ref = event.referral.ref;
      this.emit('referral', event.sender.id, event, ref);
    } else if (event.account_linking) {
      let link = event.account_linking;
      this.emit('account_link', { sender, event, link });
    } else {
      console.error('Invalid format for message.');
    }
  }

    /*
   * Verify that the callback came from Facebook. Using the App Secret from
   * the App Dashboard, we can verify the signature that is sent with each
   * callback in the x-hub-signature field, located in the header.
   *
   * https://developers.facebook.com/docs/graph-api/webhooks#setup
   *
   */
  verifyRequestSignature(req: any, res: any, buf: any) {
    const signature = req.headers['x-hub-signature'];

    if (!signature) {
      // For testing, let's log an error. In production, you should throw an
      // error.
      console.error('Couldn\'t validate the signature.');
    } else {
      const [method, signatureHash] = signature.split('=');

      const expectedHash = createHmac('sha1', this.APP_SECRET)
        .update(buf)
        .digest('hex');

      if (signatureHash !== expectedHash) {
        throw new Error('Couldn\'t validate the request signature.');
      }
    }
  }

}
