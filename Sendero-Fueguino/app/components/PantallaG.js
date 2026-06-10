'use client';

export default function PantallaG({ t, onVolver }) {
  return (
    <section className="pantalla-contraste">
      <h2 style={{ fontSize: 24, marginBottom: 16, lineHeight: 1.1 }}>{t('contraste.titulo', 'Dos formas de conocer Ushuaia')}</h2>
      <p className="texto-narrativo">{t('contraste.parrafo_1')}</p>
      <p className="texto-narrativo">{t('contraste.parrafo_2')}</p>
      <p className="texto-narrativo">{t('contraste.parrafo_3')}</p>

      <div className="tarjetas-contraste">
        <div className="tarjeta-contraste tarjeta-masivo">
          <h3>{t('contraste.tarjeta_masivo_titulo', '🚌 CIRCUITO MASIVO')}</h3>
          <p>{t('contraste.tarjeta_masivo_texto')}</p>
        </div>
        <div className="tarjeta-contraste tarjeta-alternativo">
          <h3>{t('contraste.tarjeta_alternativo_titulo', '🚶 CIRCUITO SENDERO FUEGUINO')}</h3>
          <p>{t('contraste.tarjeta_alternativo_texto')}</p>
        </div>
      </div>

      <button className="btn btn-primario btn-grande" onClick={onVolver}>
        {t('contraste.boton_ver_mapa', 'Ver el mapa →')}
      </button>
    </section>
  );
}
