export default function HistoryPage() {
  return (
    <div>
      <h1 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Historique des campagnes</h1>
      
      <div className="glass-panel data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom de la campagne</th>
              <th>Date d'envoi</th>
              <th>Canal</th>
              <th>Destinataires</th>
              <th>Taux d'ouverture</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 500 }}>Relance Inactifs J+60</td>
              <td>01 Juin 2026</td>
              <td>WhatsApp</td>
              <td>452</td>
              <td>-</td>
              <td><span className="badge badge-recent">Terminée</span></td>
            </tr>
            <tr>
              <td style={{ fontWeight: 500 }}>Promo Pack Productivité</td>
              <td>28 Mai 2026</td>
              <td>Email</td>
              <td>1205</td>
              <td>42%</td>
              <td><span className="badge badge-recent">Terminée</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
