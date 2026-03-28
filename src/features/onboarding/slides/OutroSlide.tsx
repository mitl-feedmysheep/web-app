function OutroSlide() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-background px-8 text-center">
      <h2 className="text-2xl font-bold leading-snug text-foreground">
        이제 우리 교회에<br />들어가 볼까요?
      </h2>

      <div className="mt-10 flex flex-col items-center gap-2">
        <div className="h-1 w-12 rounded-full bg-primary/30" />
        <div className="h-1 w-8 rounded-full bg-primary/20" />
        <div className="h-1 w-4 rounded-full bg-primary/10" />
      </div>
    </div>
  );
}

export default OutroSlide;
