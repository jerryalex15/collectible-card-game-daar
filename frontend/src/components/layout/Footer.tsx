import global_styles from '@/styles.module.css'
import comp_styles from './Footer.module.css'

const Footer = () => {
  return (
    <footer className={comp_styles.footer}>
      <div className={comp_styles.left}>
        <p>CODEBECQ Florian / RAZAFINDRAIBE Nandraina</p>
      </div>
      <div className={comp_styles.right}>
        <p>© 2024 Sorbonne Université</p>
      </div>
    </footer>
  )
}

export default Footer
