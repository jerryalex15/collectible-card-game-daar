// BoosterList.tsx
import BoosterItem from '../boosters/BoosterItem';
import styles from './BoosterList.module.css';

type Booster = {
  id: number;
  name: string;
  type: string;
  action?: () => void;
  actionLabel?: string;
};

interface BoosterListProps {
  boosters: Booster[];
}

function BoosterList({ boosters }: BoosterListProps) {
  return (
    <div className={styles.boosterList}>
      {boosters.map((booster) => (
        <BoosterItem
          key={booster.id}
          name={booster.name}
          image="src/assets/images/booster-le-symbole-turbo-vectoriel-du-logo-icône-d-image-vectorielle-159751507.webp"
          type={booster.type}
          action={booster.action}
          actionLabel={booster.actionLabel}
        />
      ))}
    </div>
  );
}

export default BoosterList;