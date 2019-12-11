import info from "../../src/api/info";
import * as factory from "../_fixtureFactory";
import { getSettingsForTesting } from "../_helpers";
import CancelController from "../../src/CancelController";

describe("API - info", () => {
  const settings = getSettingsForTesting({
    publicKey: factory.publicKey("image")
  });
  const uuid = factory.uuid("image");

  it("should return file info", async () => {
    const data = await info(uuid, settings);

    expect(data.uuid).toBeTruthy();
  });

  it("should be rejected with bad options", async () => {
    const settings = getSettingsForTesting({
      publicKey: factory.publicKey("empty")
    });
    const upload = info(uuid, settings);

    await (expectAsync(upload) as any).toBeRejectedWithError(Error);
  });

  it("should be able to cancel uploading", async () => {
    let controller = new CancelController();

    const settings = getSettingsForTesting({
      publicKey: factory.publicKey("image"),
      cancel: controller
    });

    setTimeout(() => {
      controller.cancel();
    }, 10);

    await expectAsync(info(uuid, settings)).toBeRejectedWithError("cancel");
  });
});