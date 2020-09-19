import { Provisioner } from '../src/index';

test('Index should contain a Provisioner', () => {
  expect(Provisioner).toBeTruthy();
});


test('Provisioner should implement createApply', () => {
  const provisioner = new Provisioner();
  expect(provisioner).toHaveProperty("createApply");
});
