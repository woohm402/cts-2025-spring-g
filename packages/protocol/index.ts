export type Language = 'KOREAN' | 'ENGLISH';

export type EngineFunction<T = null> = (
  params: { language: Language; ssml: string },
  options: T,
) => Promise<BodyInit>;
