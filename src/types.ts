/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ActiveStage {
  EMERGENCY = "EMERGENCY",
  CONFRONTATION = "CONFRONTATION",
  HOSPITAL = "HOSPITAL",
  CLAIM = "CLAIM",
  SHORTCUT = "SHORTCUT",
  ADMIN = "ADMIN"
}

export interface CopingExcuse {
  id: string;
  excuse: string;
  response: string;
  legalBasis: string;
  tips: string;
}

export interface HospitalItem {
  id: string;
  part: string;
  concern: string;
  impactOfNeglect: string;
  examinationRequired: string;
}

export interface CompensationData {
  medicalFee: number;
  missedIncomeDayRate: number;
  missedDays: number;
  transportFee: number;
  caregiverDayRate: number;
  caregiverDays: number;
  nutritionFee: number;
  propertyLoss: number;
  mentalPainFee: number;
}
