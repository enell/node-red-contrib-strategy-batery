const { expect } = require('@jest/globals')
const {
  fitnessFunction,
  splitIntoHourIntervals,
  fillInNormalPeriods,
  calculateDischargeScore,
  calculateChargeScore,
  calculateNormalScore,
} = require('../src/fitness')

describe('Fitness - splitIntoHourIntervals', () => {
  test('should split into one intervals', () => {
    expect(
      splitIntoHourIntervals({ start: 0, activity: 1, duration: 60 })
    ).toMatchObject([{ start: 0, activity: 1, duration: 60 }])
  })
  test('should split into two intervals', () => {
    expect(
      splitIntoHourIntervals({ start: 0, activity: 1, duration: 90 })
    ).toMatchObject([
      { start: 0, activity: 1, duration: 60 },
      { start: 60, activity: 1, duration: 30 },
    ])
  })
  test('should split into hour two 30min intervals', () => {
    expect(
      splitIntoHourIntervals({ start: 30, activity: 1, duration: 60 })
    ).toMatchObject([
      { start: 30, activity: 1, duration: 30 },
      { start: 60, activity: 1, duration: 30 },
    ])
  })
  test('should split into 3 intervals', () => {
    expect(
      splitIntoHourIntervals({ start: 30, activity: 1, duration: 120 })
    ).toMatchObject([
      { start: 30, activity: 1, duration: 30 },
      { start: 60, activity: 1, duration: 60 },
      { start: 120, activity: 1, duration: 30 },
    ])
  })
})

describe('Fitness - fillInNormalPeriods', () => {
  test('should test fillInNormalPeriods empty', () => {
    expect(fillInNormalPeriods(300, [])).toMatchObject([
      { start: 0, duration: 60, activity: 0 },
      { start: 60, duration: 60, activity: 0 },
      { start: 120, duration: 60, activity: 0 },
      { start: 180, duration: 60, activity: 0 },
      { start: 240, duration: 60, activity: 0 },
    ])
  })

  test('should test fillInNormalPeriods one activity', () => {
    expect(
      fillInNormalPeriods(300, [{ start: 0, duration: 300, activity: 1 }])
    ).toMatchObject([
      { start: 0, duration: 60, activity: 1 },
      { start: 60, duration: 60, activity: 1 },
      { start: 120, duration: 60, activity: 1 },
      { start: 180, duration: 60, activity: 1 },
      { start: 240, duration: 60, activity: 1 },
    ])
  })

  test('should test fillInNormalPeriods one in the middle', () => {
    expect(
      fillInNormalPeriods(300, [{ start: 120, duration: 60, activity: 1 }])
    ).toMatchObject([
      { start: 0, duration: 60, activity: 0 },
      { start: 60, duration: 60, activity: 0 },
      { start: 120, duration: 60, activity: 1 },
      { start: 180, duration: 60, activity: 0 },
      { start: 240, duration: 60, activity: 0 },
    ])
  })

  test('should test fillInNormalPeriods one long activity', () => {
    expect(
      fillInNormalPeriods(300, [{ start: 100, duration: 100, activity: 1 }])
    ).toMatchObject([
      { start: 0, duration: 60, activity: 0 },
      { start: 60, duration: 40, activity: 0 },
      { start: 100, duration: 20, activity: 1 },
      { start: 120, duration: 60, activity: 1 },
      { start: 180, duration: 20, activity: 1 },
      { start: 200, duration: 40, activity: 0 },
      { start: 240, duration: 60, activity: 0 },
    ])
  })

  test('should test fillInNormalPeriods two activities', () => {
    expect(
      fillInNormalPeriods(300, [
        { start: 70, activity: 1, duration: 80 },
        { start: 160, activity: -1, duration: 30 },
      ])
    ).toMatchObject([
      { start: 0, duration: 60, activity: 0 },
      { start: 60, duration: 10, activity: 0 },
      { start: 70, duration: 50, activity: 1 },
      { start: 120, duration: 30, activity: 1 },
      { start: 150, duration: 10, activity: 0 },
      { start: 160, duration: 20, activity: -1 },
      { start: 180, duration: 10, activity: -1 },
      { start: 190, duration: 50, activity: 0 },
      { start: 240, duration: 60, activity: 0 },
    ])
  })
})

describe('Fitness - calculateDischargeScore', () => {
  test('should discharge full hour, full battery', () => {
    expect(
      calculateDischargeScore({
        importPrice: 2,
        exportPrice: 2,
        consumption: 1,
        production: 0,
        maxDischarge: 1,
      })
    ).toEqual([0, -1])
  })

  test('should discharge full hour, empty battery', () => {
    expect(
      calculateDischargeScore({
        importPrice: 2,
        exportPrice: 2,
        consumption: 1,
        production: 0,
        maxDischarge: 0,
      })
    ).toEqual([2, -0])
  })

  test('should discharge full hour, almost empty battery', () => {
    expect(
      calculateDischargeScore({
        importPrice: 2,
        exportPrice: 2,
        consumption: 1,
        production: 0,
        maxDischarge: 0.5,
      })
    ).toEqual([1, -0.5])
  })

  test('should discharge full hour, full battery, equal production', () => {
    expect(
      calculateDischargeScore({
        importPrice: 2,
        exportPrice: 2,
        consumption: 1,
        production: 1,
        maxDischarge: 1,
      })
    ).toEqual([0, -0])
  })

  test('should discharge full hour, full battery, double production', () => {
    expect(
      calculateDischargeScore({
        importPrice: 2,
        exportPrice: 2,
        consumption: 1,
        production: 2,
        maxDischarge: 1,
      })
    ).toEqual([-2, -0])
  })
})

describe('Fitness - calculateChargeScore', () => {
  test('should charge full hour, full battery', () => {
    expect(
      calculateChargeScore({
        importPrice: 2,
        exportPrice: 2,
        consumption: 1,
        production: 0,
        maxCharge: 0,
      })
    ).toEqual([2, 0])
  })

  test('should charge full hour, empty battery', () => {
    expect(
      calculateChargeScore({
        duration: 1,
        importPrice: 2,
        exportPrice: 2,
        consumption: 1,
        production: 0,
        maxCharge: 1,
      })
    ).toEqual([4, 1])
  })

  test('should charge full hour, almost full battery', () => {
    expect(
      calculateChargeScore({
        importPrice: 2,
        exportPrice: 2,
        consumption: 1,
        production: 0,
        maxCharge: 0.5,
      })
    ).toEqual([3, 0.5])
  })

  test('should charge full hour, empty battery, equal production', () => {
    expect(
      calculateChargeScore({
        duration: 1,
        importPrice: 2,
        exportPrice: 2,
        consumption: 1,
        production: 1,
        maxCharge: 1,
      })
    ).toEqual([2, 1])
  })

  test('should charge full hour, empty battery, double production', () => {
    expect(
      calculateChargeScore({
        duration: 1,
        importPrice: 2,
        exportPrice: 2,
        consumption: 1,
        production: 2,
        maxCharge: 1,
      })
    ).toEqual([0, 1])
  })

  test('should charge full hour, empty battery, triple production', () => {
    expect(
      calculateChargeScore({
        duration: 1,
        importPrice: 2,
        exportPrice: 2,
        consumption: 1,
        production: 3,
        maxCharge: 1,
      })
    ).toEqual([-2, 1])
  })
})

describe('Fitness - calculateNormalScore', () => {
  test('should consume normal full hour no production', () => {
    expect(
      calculateNormalScore({
        importPrice: 2,
        exportPrice: 2,
        consumption: 1,
        production: 0,
        maxCharge: 1,
      })
    ).toEqual([2, 0])
  })

  test('should consume normal full hour with equal production', () => {
    expect(
      calculateNormalScore({
        importPrice: 2,
        exportPrice: 2,
        consumption: 1,
        production: 1,
        maxCharge: 1,
      })
    ).toEqual([0, 0])
  })

  test('should consume normal full hour with double production', () => {
    expect(
      calculateNormalScore({
        importPrice: 2,
        exportPrice: 2,
        consumption: 1,
        production: 2,
        maxCharge: 1,
      })
    ).toEqual([0, 1])
  })
})

describe('Fitness', () => {
  test('should calculate fitness', () => {
    const input = [
      {
        start: '2022-12-01T00:00:00.000Z',
        importPrice: 1,
        exportPrice: 1,
        consumption: 1,
        production: 0,
      },
      {
        start: '2022-12-01T01:00:00.000Z',
        importPrice: 1,
        exportPrice: 1,
        consumption: 1,
        production: 0,
      },
    ]
    const totalDuration = 2 * 60
    const batteryMaxEnergy = 1
    const batteryMaxInputPower = 1
    const soc = 0
    const score = fitnessFunction({
      totalDuration,
      input,
      batteryMaxEnergy,
      batteryMaxInputPower,
      soc,
    })([
      { start: 30, duration: 60, activity: 1 },
      { start: 90, duration: 30, activity: -1 },
    ])
    expect(score).toEqual(-2.5)
  })

  test('should calculate fitness with soc', () => {
    const input = [
      {
        start: '2022-12-01T00:00:00.000Z',
        importPrice: 1,
        exportPrice: 1,
        consumption: 1,
        production: 0,
      },
      {
        start: '2022-12-01T01:00:00.000Z',
        importPrice: 1,
        exportPrice: 1,
        consumption: 1,
        production: 0,
      },
    ]
    const totalDuration = 2 * 60
    const batteryMaxEnergy = 1
    const batteryMaxInputPower = 1
    const averageConsumption = 1
    const averageProduction = 0
    const soc = 1
    const score = fitnessFunction({
      input,
      totalDuration,
      batteryMaxEnergy,
      batteryMaxInputPower,
      soc,
    })([
      { start: 30, duration: 60, activity: 1 },
      { start: 90, duration: 30, activity: -1 },
    ])
    expect(score).toEqual(-1.5)
  })

  test('should calculate 180 min charge period', () => {
    let now = Date.now()
    now = now - (now % (60 * 60 * 1000))
    const input = [
      {
        start: new Date(now).toString(),
        importPrice: 1,
        exportPrice: 1,
        consumption: 1.5,
        production: 0,
      },
      {
        start: new Date(now + 60 * 60 * 1000).toString(),
        importPrice: 500,
        exportPrice: 500,
        consumption: 1.5,
        production: 0,
      },
      {
        start: new Date(now + 60 * 60 * 1000 * 2).toString(),
        importPrice: 500,
        exportPrice: 500,
        consumption: 1.5,
        production: 0,
      },
    ]
    const totalDuration = 3 * 60
    const batteryMaxEnergy = 3 // kWh
    const batteryMaxInputPower = 3 // kW
    const soc = 0
    let score = fitnessFunction({
      input,
      totalDuration,
      batteryMaxEnergy,
      batteryMaxInputPower,
      soc,
    })([{ start: 0, duration: 180, activity: -1 }])
    expect(score).toEqual(-1501.5)

    console.log(score)
  })
})
