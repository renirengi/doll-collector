export type DollStatus = 'active' | 'sold' | 'gifted';

export type DollBrand =
  | 'Barbie'
  | 'Monster High'
  | 'Ever After High'
  | 'Bratz'
  | 'Rainbow High'
  | 'Other' | 'Liv'|'Lol OMG' | 'Shadow High' | 'Kurhn' | 'Sandra' | 'Once Upon a Zombie' | 'Steffi Love' | 'Disney ILY 4ever';

export type Manufacturer = 'Mattel' | 'Kurhn' | 'MGA Entertainment' | 'WowWee' | 'Hasbro' | 'Disney' | 'Other' | 'Spin Master' | 'GWToys' | 'Jakks Pacific'| 'Simba Toys';

export type DollState = 'New' | 'Used-Collector' | 'Used-Child';

export type ArticulationType =
  | 'Basic'
  | 'LegsArticulated'
  | 'ArmsArticulated'
  | 'FullyArticulated'
  | 'SuperArticulated'
  | 'Other';


export type BodyVolume =
  | 'Standard'
  | 'Tall'
  | 'Petite'
  | 'Curvy'
  | 'SuperCurvy'
  | 'Other';

export type FootType =
  | 'Flat Standard'
  | 'Flat Non-Standard'
  | 'Heeled'
  | 'Small Heeled'
  | 'Universal';

export type DollGeneration =
  | 'G1' | 'G2' | 'G3'
  | 'Vintage' | 'Mod' | 'Modern'
  | 'Classic' | 'Reboot' | 'Other';

export type OutfitState = 'original' | 'nude' | 'custom';

export type Gender = 'Male' | 'Female' | 'Unisex';
