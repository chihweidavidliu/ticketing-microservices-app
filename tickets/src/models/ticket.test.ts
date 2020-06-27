import { Ticket } from "./ticket";

it("implements optimistic concurrency control", async (done) => {
  // create ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 5,
    userId: "23453",
  });

  // save the ticket
  await ticket.save();

  // fetch the ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two separate changes to the tickets we fetched
  firstInstance?.set({ price: 10 });
  secondInstance?.set({ price: 15 });

  // save the first fetched ticked  (making the second fetched ticket out of date);
  await firstInstance?.save();

  // try to save the second fetched ticket and expect an error
  try {
    await secondInstance?.save();
  } catch (error) {
    done();
    return;
  }

  throw new Error("Should not reach this point");
});

it("increments version number when an update is made", async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 5,
    userId: "23453",
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);

  ticket.set({ price: 10 });
  await ticket.save();
  expect(ticket.version).toEqual(1);

  ticket.set({ price: 13 });
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
