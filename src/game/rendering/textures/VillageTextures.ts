import Phaser from 'phaser';
import { ellipse, texture } from './TexturePrimitives';

export function createVillageArtwork(scene: Phaser.Scene): void {
  for (const [key, coat, trim, tool] of [
    ['npc-armorer', '#785b76', '#dfb6ca', '▣'],
    ['npc-healer', '#608e7e', '#a5e3cd', '✚'],
    ['npc-trader', '#887555', '#e4cea2', '◈'],
  ]) {
    texture(scene, key, (c) => {
      ellipse(c, 32, 57, 20, 4, '#102a2244');
      ellipse(c, 22, 54, 7, 7, '#413f38');
      ellipse(c, 43, 54, 7, 7, '#413f38');
      ellipse(c, 32, 39, 21, 20, coat);
      ellipse(c, 32, 21, 15, 15, '#b89c73');
      c.fillStyle = coat;
      c.beginPath();
      c.moveTo(15, 18);
      c.lineTo(20, 4);
      c.lineTo(36, 0);
      c.lineTo(48, 14);
      c.lineTo(51, 20);
      c.fill();
      ellipse(c, 25, 22, 2, 3, '#203932');
      ellipse(c, 39, 22, 2, 3, '#203932');
      c.strokeStyle = trim;
      c.lineWidth = 3;
      c.strokeRect(22, 34, 20, 17);
      c.fillStyle = trim;
      c.font = 'bold 20px sans-serif';
      c.textAlign = 'center';
      c.fillText(tool, 32, 50);
      ellipse(c, 11, 40, 5, 5, '#b89c73');
      ellipse(c, 54, 40, 5, 5, '#b89c73');
    });
  }
  texture(scene, 'dawnblade', (c) => {
    c.strokeStyle = '#eac783';
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(13, 56);
    c.lineTo(47, 14);
    c.stroke();
    c.strokeStyle = '#fff3c7';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(17, 52);
    c.lineTo(51, 6);
    c.stroke();
    c.strokeStyle = '#9ecbca';
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(20, 39);
    c.lineTo(35, 51);
    c.stroke();
    ellipse(c, 29, 42, 5, 5, '#fbec9e');
  });
  texture(scene, 'runicstaff', (c) => {
    c.strokeStyle = '#91c7b1';
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(13, 58);
    c.lineTo(44, 19);
    c.stroke();
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      ellipse(c, 45 + Math.cos(a) * 10, 14 + Math.sin(a) * 10, 5, 5, '#d0fff0');
    }
    ellipse(c, 45, 14, 8, 8, '#69d3b5');
    c.strokeStyle = '#f3e1a9';
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(45, 14, 15, 0, Math.PI * 2);
    c.stroke();
  });
  texture(scene, 'bell', (c) => {
    c.fillStyle = '#a99560';
    c.beginPath();
    c.moveTo(16, 48);
    c.lineTo(21, 18);
    c.quadraticCurveTo(31, 3, 43, 18);
    c.lineTo(49, 48);
    c.fill();
    ellipse(c, 32, 48, 20, 6, '#e5ce85');
    ellipse(c, 32, 48, 13, 3, '#6c6455');
    ellipse(c, 32, 51, 4, 7, '#f2e0a6');
    c.strokeStyle = '#eddca6';
    c.lineWidth = 2;
    c.beginPath();
    c.arc(32, 28, 7, 0, Math.PI * 2);
    c.stroke();
  });
  for (let i = 0; i < 3; i++) {
    texture(scene, `rune-${i}`, (c) => {
      ellipse(c, 32, 53, 22, 7, '#102f2544');
      c.fillStyle = '#526b65';
      c.beginPath();
      c.moveTo(11, 51);
      c.lineTo(15, 12);
      c.lineTo(26, 4);
      c.lineTo(47, 12);
      c.lineTo(54, 52);
      c.fill();
      c.strokeStyle = ['#d6bae7', '#f5c495', '#ade2b4'][i];
      c.lineWidth = 3;
      c.beginPath();
      if (i === 0) {
        c.arc(32, 28, 11, 0.5, 5.4);
        c.stroke();
      } else if (i === 1) {
        c.moveTo(32, 15);
        c.lineTo(26, 30);
        c.lineTo(38, 29);
        c.lineTo(30, 42);
        c.stroke();
      } else {
        c.moveTo(32, 15);
        c.lineTo(32, 42);
        c.moveTo(19, 25);
        c.lineTo(32, 33);
        c.lineTo(44, 24);
        c.stroke();
      }
    });
  }
  texture(scene, 'wisp', (c) => {
    const glow = c.createRadialGradient(32, 32, 1, 32, 32, 30);
    glow.addColorStop(0, '#fff6bf');
    glow.addColorStop(0.4, '#e7c48488');
    glow.addColorStop(1, '#e7c48400');
    ellipse(c, 32, 32, 30, 30, glow);
    ellipse(c, 32, 32, 9, 13, '#fff1b1');
    ellipse(c, 28, 29, 1, 2, '#766b52');
    ellipse(c, 36, 29, 1, 2, '#766b52');
  });
}
