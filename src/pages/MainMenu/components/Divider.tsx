type DividerProps = {
  visible?: boolean;
  spacing?: string;
};

export default function Divider({ visible = false, spacing = 'my-2' }: DividerProps) {
  return <div className={`h-px w-full ${visible ? 'bg-white/10' : 'bg-transparent'} ${spacing}`} />;
}
